First Come, First Serve
===

A Discord bot that enhances First Come, First Serve in voice channel waiting rooms. 

## Configuring Bot Admin, Mod, and Helper roles:  
*All of these commands require the Administrator permission to use.*

`addadminrole "<roleName>"`  
Adds a role as Bot Admin. Admin commands are described below.  
*Aliases:* `aar`

`removeadminrole "<roleName>"`  
Removes a role as Bot Admin.  
*Aliases:* `rar`

`listadminroles`  
Lists all Bot Admin roles for the server.
*Aliases:* `lar`

`addmodrole "<roleName>"`  
Adds a role as Bot Mod. Mod commands are described below.  
*Aliases:* `amr`

`removemodrole "<roleName>"`  
Removes a role as Bot Mod.  
*Aliases:* `rmr`

`listmodroles`  
Lists all Bot Mod roles for the server.  
*Aliases:* `lmr`

`addhelperrole "<roleName>"`  
Adds a role as Bot Helper. Helper commands are described below.  
*Aliases:* `ahr`

`removehelperrole "<roleName>"`  
Removes a role as Bot Helper.  
*Aliases:* `rhr`

`listhelperroles`  
Lists all Bot Helper roles for the server.  
*Aliases:* `lhr`

## Bot Admin commands:  
*All of these commands require Bot Admin permissions to use. Bot Admins may also use commands from Bot Mod and Bot Helper.*

`setprefix <prefix>`  
Sets the bot prefix for the server.  
*Aliases:* `prefix`

`createwaitingroom "<monitorChannel>" <displayCount> <rejoinWindow> <afkCheckDuration>`  
Creates a waiting room that displays the first displayCount members to join monitorChannel in the channel the command was typed in, with a grace period of rejoinWindow for accidental disconnects, and waiting afkCheckDuration to remove the user from queue when they're afk-checked.  
*Aliases:* `cwr`  
*Example:* `fcfs!cwr "Waiting Room 1" 10 1m 5m`

`deletewaitingroom "<monitorChannel>"`  
Removes the waiting room associated with `monitorChannel`.  
*Aliases:* `dwr`

`listwaitingrooms`  
Lists all waiting rooms in the server.  
*Aliases:* `lwr`

`setdisplaysize "<monitorChannel>" <displaySize>`  
Sets the display max length for the waiting room associated with `monitorChannel`.  
*Aliases:* `sds`

`setrejoinwindow "<monitorChannel>" <rejoinWindow>`  
Sets the rejoin window for the waiting room associated with `monitorChannel`.  
*Aliases:* `srw`

`setafkcheckduration "<monitorChannel>" <afkCheckDuration>`  
Sets the AFK check duration for the waiting room associated with `monitorChannel`.  
*Aliases:* `sacd`

`setautomatic "<monitorChannel>" <interval> [outputChannel]`
Creates an automatic afk-check every `interval`, putting the output in `outputchannel` if specified, or the channel
the command was typed in otherwise.
*Aliases:* `sa`
*Example:* `fcfs!sa "Waiting Room 1" 45m` OR `fcfs!sa "Waiting Room 1" off`

## Bot Mod commands:  
*All of these commands require Bot Mod permissions to use. Bot Mods may also use commands from Bot Helper.*

`setposition <member> <position>`  
Sets a user's position in the queue that they're in.  
*Aliases:* `sp`

`afkchecktop "<monitorChannel>"`,  
AFK-checks all members displayed in the waiting room display.

## Bot Helper commands:  
*All of these commands require Bot Helper permissions to use.*  

`afkcheck <member>`  
Sends the user a DM with a reaction on it, which they must click within the configured `afkCheckDuration` to stay in the queue.  
*Aliases:* `afk`

## Base Commands:  
*Anyone can use these commands.*  

`info "<monitorChannel>"`  
Displays info about the waiting room associated with `monitorChannel`.  
*Example:* `fcfs!info "Waiting Room 1"`

`position "[member]"`  
Displays the command sender's position in the queue, or the referenced `member`.  
*Aliases:* `p`  
*Example:* `fcfs!p "peril"` OR `fcfs!p`

`queuelength "<monitorChannel>"`  
Displays the queue length of the waiting room associated with `monitorChannel`.  
*Aliases:* `ql`  
*Example:* `fcfs!ql "Waiting Room 1"`