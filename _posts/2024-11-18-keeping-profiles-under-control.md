---
title: Keeping profiles under control with a remdiation.
lead: Free up disk space by deleting inactive profiles.
ogimage: "https://alaycock.co.uk/assets/2024/11/keeping-profiles-under-control/og-image.png"
date: 2024-11-18
tags:
 - intune
 - powershell
---
We had a persistent problem in school with computers having low disk space. This issue came from the local user profiles and was a constantly building issue as the number of profiles on each computer would just keep growing. With software like [Teams installing in AppData](https://superuser.com/questions/1634322/where-is-microsoft-teams-application-located-on-my-windows-10-computer#:~:text=If%20Microsoft%20Teams%20is%20actually%20installed%20then%20it%27s,location%20then%20Microsoft%20Teams%20is%20not%20actually%20installed.) local user profiles are becoming rather large.

We have a rather agressive profile clearing policy that should be deleting all profiles over 14 days old for student computers and 60 on staff computers. This has been rendered useless by some annoying _bugs_ in Windows 10+ where profiles have [always been accessed today](https://techcommunity.microsoft.com/t5/windows-deployment/issue-with-date-modified-for-ntuser-dat/td-p/102438).

Even when this policy works its not the best solution for us, especially on our high traffic computers. For example a computer in one of our main IT suites could see in the region of 20 users a week which means a lot of recently used profile space.

As with a lot of things in Windows the solution is PowerShell, in this case an [Intune Remediation](https://learn.microsoft.com/en-us/mem/intune/fundamentals/remediations).

An Intune Remediation is made up of 2 PowerShell scripts. One that _detects_ a device in need of remediation and then another that _remediates_ the device. The detection is then run again to ensure that the device has been _remediated_ correctly.

## Detecting a device that needs remediating

The detection script for this issue is very simple.

```powershell
$logPath = "C:\LOG\Path\here.txt"

if (-not (Test-Path -Path $logPath)){
    New-Item -Path $logPath -ItemType File | Out-Null
}


$disk = Get-Volume -DriveLetter C

Add-Content -Path $logPath -Value "$(Get-Date): Testing disk space for profiles"

if($disk.SizeRemaining -lt 20GB){
    Add-Content -Path $logPath -Value "$(Get-Date): Less than 20GB remaining, will remediate"

    exit 1
}

Add-Content -Path $logPath -Value "$(Get-Date): More than 20GB remaining"


exit 0
```

When a detection script exits with `0` the device is fine, any other exit code means that the computer requires remediation.

This script exits `1` if there is less than `20GB` left on the C: drive.

## Remediating the computer

When a device needs remediating the script needs to delete profiles from the computer until it has more than `30GB` of space on the disk.

> We clear to 30GB so that the computer doesn't keep getting remediated every day when a new profile is created.

A profile can be deleted if:

 - It is not currently logged in.
 - It is not the only profile on the computer.

There is then an additional requirement that is harder to code for. We don't want to delete the profile of the computers "main user". As has happened on some of our machines with cover and room shares the main teacher in a room has found thier profile deleted. It's not a big issue as the local profile is only settings, but it slows people down and isn't the best outcome when there were other profiles it could have cleared. We set the main user by ending the computers hostname with the user's username. This admitedly only works because we have 3 letter usernames for staff so `RMXX-T-YYY` is a pretty descriptive hostname. It's then a simple compare in the script to see if the target folder matches the last 3 letters of the hostname.

```powershell
$logPath = "C:\LOG\Path\here.txt"

function Delete-OldestProfile {
    $computerOwner = ($env:computername -replace '^.*(?=.{3}$)').ToLower()
    
    $profiles = gwmi win32_userprofile | Where-Object { $_.Special -eq $false -and $_.Loaded -eq $false -and -not (($_.LocalPath.split('\')[-1]).toLower() -eq $computerOwner)}

    Add-Content -Path $logPath -Value "$(Get-Date): There are $($profiles.Count) deletion candidates"


    if($profiles.Count -gt 0){
        # There are multiple profiles on this computer.
    
        $usernames = ($profiles | Select -Property @{Name = 'Username'; Expression = {$_.LocalPath -replace "C:\\Users\\", ""}}).Username

        $logonEvents = Get-WinEvent -ProviderName 'Microsoft-Windows-Security-Auditing' -FilterXPath "*[System[EventID=4624] and EventData[Data[@Name='LogonType']='2'] and EventData[Data[@Name='VirtualAccount']='%%1843']]" | Select-Object @{Name = 'LoginDate'; Expression = {$_.TimeCreated}}, @{Name = 'Username'; Expression = { $_.Properties.Value[5] }}, @{Name = 'SID'; Expression = { $_.Properties.Value[4]}} | Group-Object Username | Where-Object {$_.Name -in $usernames}

        $lastUser = $logonEvents[-1].Name

        Add-Content -Path $logPath -Value "$(Get-Date): Deleting $($lastUser)"

        Get-CimInstance -Class Win32_UserProfile | Where-Object { $_.LocalPath.split('\')[-1] -eq $lastUser } | Remove-CimInstance
    }
}

function Can-DeleteProfile {
    $profiles = gwmi win32_userprofile | Where-Object { $_.Special -eq $false -and $_.Loaded -eq $false -and -not (($_.LocalPath.split('\')[-1]).toLower() -eq $computerOwner)}

    return $profiles.Count -gt 0
}

function Should-DeleteProfile {
    $disk = Get-Volume -DriveLetter C

    if($disk.SizeRemaining -lt 30GB){
        return $true
    }

    return $false
}

if (-not (Test-Path -Path $logPath)){
    New-Item -Path $logPath -ItemType File | Out-Null
}

Add-Content -Path $logPath -Value "$(Get-Date): Checking for profiles to delete"

while((Should-DeleteProfile) -and (Can-DeleteProfile)){
    Delete-OldestProfile
}

Add-Content -Path $logPath -Value "$(Get-Date): Process finished"
```

With this a computer is reliabley remediated back to a usable state.

After running for well over a year we've not had an issue since.

![Remediation Stats](/assets/2024/11/keeping-profiles-under-control/remediation-stats.png)

We do have some computers here that simply have disks that are too small. This remediation does give us a nice list of computers that need an upgrade.


