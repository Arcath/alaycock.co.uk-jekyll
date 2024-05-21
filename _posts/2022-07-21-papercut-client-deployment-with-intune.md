---
layout: post
title: Papercut Client deployment with Intune
lead: Building on the official Papercut intructions to reliably deploy the Papercut client with Intune.
date: 2022-07-21
tags:
  - papercut
---
Papercut have a ["handy" guide](https://www.papercut.com/kb/Main/DeployUserClientwithMS-Intune) on how to deploy the client using Intune on their site which I thought was going to be the end of this. However there are 2 fatal flaws with their approach.

1. It deploys in the user's context so if they aren't a local admin on the computer it will fail to install.
2. Post install it wont auto start.

Looking at the comments on that article there is a solution to point 1 which with a couple of minor edits could be a solution to point 2.

> If you are deploying the NG client simply change `MF` to `NG` in any paths below.

## install.ps1

The MSI contains a property that tells Intune that this is a user context app which means Intune wont offer the option to install it in the system context. This means the only way to run it in the system context is to wrap it in a script.

To get the suggested script to setup auto start the client as well it just needs to create a registry key in `HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run` that points to `pc-client.exe`. 

I've also added a function from [Jonathan Medd](https://www.jonathanmedd.net/2014/02/testing-for-the-presence-of-a-registry-key-and-value.html) to test is the property exists before creating it.

```ps1
$argumentlist = "/qn /L papercut.log ALLUSERS=1"

# See https://www.jonathanmedd.net/2014/02/testing-for-the-presence-of-a-registry-key-and-value.html
function Test-RegistryValue {
    param (
        [parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]$Path,

        [parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]$Value
    )

    try {
        Get-ItemProperty -Path $Path | Select-Object -ExpandProperty $Value -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

try {
    Start-Process ".\win\pc-client-admin-deploy.msi" -ArgumentList $argumentlist
    if(-Not (Test-RegistryValue -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -Value "PapercutMFClient")){
        New-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "PaperCutMFClient" -Value "C:\Program Files\PaperCut MF Client\pc-client.exe"
    }
} catch {
    Write-Output "$($env:COMPUTERNAME) Error: $($_.Exception.Message)"
}
```

## uninstall.ps1

With Intune you need to make sure that it can uninstall the item as well, you never know if Papercut are going to release a new client that doesn't update the existing one. Uninstall is pretty much the same process, run the uninstall command and delete the registry key.

```ps1
$argumentlist = '/x "{A213EB00-99FE-11EC-BC52-DA2D66F1ACF7}" /qn /L papercut.log'
try {
    Start-Process "msiexec" -ArgumentList $argumentlist
    Remove-ItemProperty -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "PaperCutMFClient"
} catch {
    Write-Output "$($env:COMPUTERNAME) Error: $($_.Exception.Message)"
}
```

## Packaging and Deploying

As per the guide from Papercut, copy the whole of the PCClient folder over to your source folder and then paste in `install.ps1` and `uninstall.ps1`. Then run the [Intune Packager](https://github.com/Microsoft/Microsoft-Win32-Content-Prep-Tool) to create your `.intunewin` file.

![Intune packaging window](/assets/2022/02/papercut-client-deployment-with-intune/papercut-pacakge.jpg)

Then on Intune create a new _Windows App (Win32)_ and upload the `.intunewin` you just created.

I set the name to _Papercut MF Client_, gave it a quick description and set the version/publisher as needed.

The install command needs to be:

```cmd
powershell -executionpolicy bypass -file install.ps1
```
and the uninstall command needs to be:

```cmd
powershell -executionpolicy bypass -file uninstall.ps1
```

Crucially make sure that the _Install behavior_ is _System_.

The current client is 64 Bit only and runs on any Windows 10.

For detection rules I used a _Rule Type_ of _File_, a _Path_ of `C:\Program Files\PaperCut MF Client`, a _File or folder_ of `pc-client.exe` and a _Detection method_ of _File or folder exists_.

![Detection Rules](/assets/2022/02/papercut-client-deployment-with-intune/papercut-detection.jpg)

It has no requirements or supersedence (until we update it) so its just a case of selecting the group to deploy it to. I have a group for all on-site workstations which I applied it to.

## That's It!

The only weird thing is that despite the script explicitly stating `HKLM:\Software\Microsoft\Windows\CurrentVersion\Run` for the value it gets created in `HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Run`. This isn't any issue for us as both keys work but for other software you might [find this article interesting](https://call4cloud.nl/2021/05/the-sysnative-witch-project/).