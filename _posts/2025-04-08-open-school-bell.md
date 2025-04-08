---
title: Open School Bell
lead: Building a modern bell system for schools.
date: 2025-04-08
tags:
 - open-school-bell
 - remix
 - raspberry-pi
---
Over at [Longridge High School](https://www.lhs.lancs.sch.uk) we had a problem with our bells. Our aged system relies on radio pulses to trigger the bells around the school, which works great in testing during the holidays but falls apart when nearly 1000 people come into site with phones, watches, and all the other RF emitting devices across the school. For a while the issue of the odd bell not going off was annoying, but fixable with a good clock in the classroom. It does however become dangerous when we send out a lockdown signal and half the school doesn't get it.

This all came to a head with our new building, did we want to pay to extend this system if its something we want to replace?

## Commercial Solutions

Obviously building our own system was not our first thought. So we asked around and got a couple of quotes for 2 different approaches.

The first was the modern equivilent of our current system. It uses a network connected master-clock to trigger bells that are also on the network. On-paper pretty good, but its fatal flaw is that it uses PoE to power the bells. This provides a low wattage to the speakers and results in a very quiet sound. _Easily_ mitigated by putting in more bells, but has a significant cost implication.

The other main solution used a cloud based app to communicate with on-prem boxes that are connected to an amplifier, which in turn is wired to a speaker in every room. This has one big flaw/consideration that I raised before the quote even came through. The _cloud based app_, our ability to trigger lockdowns is dependent on a functioning internet connection, no outages for us or them. There is also questions about how the on-prem boxes work, would they ring lesson-change if the internet was down? Throw in the phone apps, imagine running from an intruder and being asked to log back into an app you never open.

## Can we build it?

Within the IT team we had discussed the options, before the quotes came through, which made us think the quotes would be a fair bit lower than they actually turned out to be.

The PoE system to us seemed like it should be pretty cheap right? Arduino style chip, PoE hat, DAC+amp with a speaker. How could that be more than £50-£75 a unit? This is also where our concerns about volume came from.

Having a small computer connected to an amp with speaker wire around the area seemed like a much better option to us. The cost of this option came in a fair bit higher than we had hoped, along with a relatively high annual cost. Which brings in the added issue of if we stop paying maintenance do we no have no bells?

This was all becoming a lot of money for the intial problem of no bells in the new building. We where sitting on a persistent niggling thought that we could build this ourselves. So what would we want our system to look like?

### Specification

 - Local controller, everything running in school.
 - Network connected, trigger lockdowns from anything on the network.
 - Pis that would run indepedently and still work for lesson change even if the controller was down.
 - Monitoring through Zabbix, so we know whats going on at any given moment.
 - Link to the old bells so we could spread teh cost and run the transition in phases.
 - Text to Speech for tannoy annoucements.

## Open School Bell

The end result is of course that we built something ourselves. [Open School Bell](https://openschoolbell.co.uk/) is that something, an open-source bell solution that supports everything we need it to and is a platform to build out beyond that in the future.

There are 3 main components to the system, all installed in _phase 1_ of our implementation.

 1. The [controller](https://github.com/Open-School-Bell/controller), a [Remix](https://remix.run/) app in a docker container which runs along side a couple of other services to provide the central control system for the bells.
 2. The [sounder](https://github.com/Open-School-Bell/sounder), a node js service that runs on a Raspberry Pi connected to an amplifier, or to a relay that triggers a ringer wire.
 3. The screen, an additional service on the sounder that displays on a Pi Touch Display 2, giving users an interface to the system.


![A Raspberry Pi connected to an amplifier](/assets/2025/04/open-school-bell/amp.jpg)

![Terminal](/assets/2025/04/open-school-bell/terminal.jpg)

Over the Easter holidays we've now installed the amplifier in our new building. 10 speakers spread across 6 classrooms, 2 stairwells, 1 office and an entrance way. This is after running the system for a couple of weeks for stability testing.

In the main office, near the master-clock for our current system, we fitted a second sounder to run the screen. This sounder also has a relay in it connected to the current bells. Open School Bell can now trigger the old bell system on the same schedule, bringing network control and network time to the old system.

Open School Bell is going to be our focus for a while. It will be run through its paces with lockdown drills and of course running every scheduled bell from now on.
