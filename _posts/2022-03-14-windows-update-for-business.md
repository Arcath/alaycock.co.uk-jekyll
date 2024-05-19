---
layout: post
title: Windows Update for Business
date: 2022-03-14T18:20:37.426Z
tags:
  - windows-update
---

I've been working with WSUS for years and over the last couple its become extremely apparent that without continual maintenance it can become un-managable. If I have to click *reset server node* one more time...

For a while now Microsoft has been talking about [Windows Update for Business](https://docs.microsoft.com/en-us/windows/deployment/update/waas-manage-updates-wufb) which isn't exactly a replacement for WSUS but can be used as one.

The idea is to update directly from Microsoft Update with a varying ammount of delay. I went for 3 "rings", *Testing* which gets updates with no delay and installs them on the same day. *Pilot* which gets updates 7 days after release and only installs on a Saturday during our scheduled install slot. *Default* which gets updates 14 days after release and installs on the Saturday in the same install slot.

The staggering is a key part of WUfB, you can think of this as the same as only approving updates to certain groups in WSUS. This allows me and the rest of the IT team to get updates straight away and test them. Our pilot users (IT Teachers) then get the updates a week later to confirm that there are no problems before finally all the computers in school get the updates.

If an update causes problems the workflow becomes:

1. Update the WUfB policies to pause updates after the current date. This stops the other other rings from installing updates released after the given date.
2. Diagnose the fault, either applying new configuration to the computers or confirming that the update is faulty and waiting for the fixed update.
3. Confirm that the solution works on the testing ring and then remove pause date from the policies.

## Delivery Optimisation

One of WSUS's main features for us is as a on-site cache of updates, removing the need for computers to hit the internet to download them. Seeing as WUfB pulls directly from Microsoft you might be a little worried that the bandwidth use of updates will go way up.

[Delivery Optimisation](https://docs.microsoft.com/en-us/windows/deployment/do/waas-delivery-optimization) allows clients on the same network to share the updates they have downloaded. Couple this with the rings and our IT Office PCs will get the updates and then share them out when the pilot ring catches up.

## Group Policies

I'm going to make use of Group Policy Precedence to make this job a bit easier. To start with I have `Computer - WUfB (Default)` at the top of my workstations OU applying to everything which configures Windows Update to install on a Saturday and applies the default WUfB config. Then there are two specific GPOs for the *Pilot* and *Testing* rings. These GPOs are filtered by group membership to ensure only the specific computers get the settings. The Pilot GPO simply changes the delays and doesn't touch the Windows Update settings. The Testing GPO however removes the delays and over-rides the Windows Update settings to prompt the user to install every day.

### Computer - WUfB (default)

{% raw %}
<GPO data={{
  computer: {
    policies: {
      administrativeTemplates: {
        'Windows Components': {
          'Delivery Optimization': {
            'Download Mode': {
              value: 'LAN (1)',
              about: 'Sets the download mode to LAN, allowing computers to download from each other. This is the default on a domain.'
            }
          },
          'Windows Update': {
            'Automatic Updates detection frequency':{
              value: 'Check for updates at the following interval (hours): 4',
              about: 'Gets the computer to check for and download updates every 4 hours.'
            },
            'Configure Automatic Updates': {
              'Configure automatic updating': {
                value: '4 - Auto download and schedule the install',
                about: 'Tells windows update the automatically download the updates and install them at the time set in the next settings.'
              },
              'Install during automatic maintenance': {
                value: 'Disabled',
                about: 'We don\'t use automatic maintence, instead favouring a set install time'
              },
              'Scheduled Install day': {
                value: '7 - Every Saturday',
                about: 'Install every Saturday, we have Impero turn all the computers on for this deployment.'
              },
              'Scheduled install time': {
                value: '10:00',
                about: 'Install at 10am'
              },
              'Every Week': {
                value: 'Enabled',
                about: 'Install every week.'
              },
              'Install updates for other Microsoft products': {
                value: 'Enabled',
                about: 'Allows the computer to update Office etc... as well.'
              }
            },
            'Configure auto-restart reminder notifications for updates': {
              value: 'Disabled',
              about: 'We don\'t want staff and students to be pestered about updates.'
            },
            'Windows Update for Business': {
              'Select when Preview Builds and Feature Updates are received': {
                'Select the Windows eadiness level for the updates you want to receive': {
                  value: 'Semi-Annual Channel',
                  about: 'Sets the client to install the semi-annual updates, e.g. 21H2'
                },
                'After a Preview Build or Feature Update is released, defer receiving it for this many days': {
                  value: '30',
                  about: 'Waits 30 days after big updates to deploy them to clients.'
                },
                'Pause Preview Builds or Feature Updates starting': {
                  value: '',
                  about: 'Set this value to a date, e.g. 2022-03-22 to pause updates for the 30 days following this date. Remove to re-enable updates.'
                }
              },
              'Select when Quality Updates are received': {
                icon: '⚙️',
                'After a quality update is released, defer receiving it for this many days': {
                  value: '14',
                  about: 'Waits 14 days after quality updates to deploy them to clients.'
                }
              }
            }
          }
        }
      }
    }
  }
}} />
{% endraw %}

### Computer - WUfB (Pilot)

{% raw %}
<GPO data={{
  computer: {
    policies: {
      administrativeTemplates: {
        'Windows Components': {
          'Windows Update': {
            'Windows Update for Business': {
            'Select when Preview Builds and Feature Updates are received': {
              'Select the Windows eadiness level for the updates you want to receive': {
                value: 'Semi-Annual Channel',
                about: 'Sets the client to install the semi-annual updates, e.g. 21H2'
              },
              'After a Preview Build or Feature Update is released, defer receiving it for this many days': {
                value: '14',
                about: 'Waits 14 days after big updates to deploy them to clients.'
              },
              'Pause Preview Builds or Feature Updates starting': {
                value: '',
                about: 'Set this value to a date, e.g. 2022-03-22 to pause updates for the 30 days following this date. Remove to re-enable updates.'
              }
            },
            'Select when Quality Updates are received': {
              'After a quality update is released, defer receiving it for this many days': {
                value: '7',
                about: 'Waits 7 days after quality updates to deploy them to clients.'
              }
            }
          }
          }
        }
      }
    }
  }
}} />
{% endraw %}

### Computer - WUfB (Testing)

{% raw %}
<GPO data={{
  computer: {
    policies: {
      administrativeTemplates: {
        'Windows Components': {
          'Windows Update': {
            'Configure Automatic Updates': {
              'Configure automatic updating': {
                value: '3 - Auto download and notify for install',
                about: 'Tells windows update the automatically download the updates and notify the user to install them.'
              },
              'Install updates for other Microsoft products': {
                value: 'Enabled',
                about: 'Allows the computer to update Office etc... as well.'
              }
            },
            'Windows Update for Business': {
              'Select when Preview Builds and Feature Updates are received': {
                'After a Preview Build or Feature Update is released, defer receiving it for this many days': {
                  value: '0',
                  about: 'Waits 0 days after big updates to deploy them to clients.'
                },
                'Pause Preview Builds or Feature Updates starting': {
                  value: '',
                  about: 'This is redundant in this group as they are going to receive all updates straight away and they will inform the pauses for the other policies.'
                }
              },
              'Select when Quality Updates are received': {
                'After a quality update is released, defer receiving it for this many days': {
                  value: '0',
                  about: 'Waits 0 days after quality updates to deploy them to clients.'
                }
              }
            }
          }
        }
      }
    }
  }
}} />
{% endraw %}

## Pros and Cons

- **Pro**: Windows updates deploy quickly to every computer.
  
- **Con:** All updates deploy, no ability to block drivers etc...
  
- **Pro**: Works off site, allowing devices to update even when they can't see the WSUS server.
  
- **Con**: Will result in an uptick in bandwidth use as some clients will still download from the internet, and any downloads will occur whilst the computers are actually in use and not overnight as WSUS used to do.
  
- **Pro**: Easy to manage, once setup the only time any changes are needed is when you want to pause updates.
  
Overall I think the benefits outweigh the potential issues. It's been a smooth rollout here and that was with a backlog of updates to deploy.

I will concede that we don't have SCCM or Intune so we might not have been giving WSUS a fair go of it. However for us right now this solution is doing a great job and I can rest easy knowing our computers are all getting updates.