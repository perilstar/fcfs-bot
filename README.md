First Come, First Serve
===

A Discord bot that enhances First Come, First Serve in voice channel waiting rooms. 

**__Commands__**  
default prefix: fcfs!

`setprefix <prefix>`  
Changes the bot prefix in this server.

`(createwaitingroom|cwr) "<monitorChannel>" <firstN> <rejoinWindow> <afkCheckDuration>`  
Creates a monitor for the channel specified by `monitorChannel` that displays the first `firstN` users in the queue, allowing them `rejoinWindow` of time being disconnected before they\'re removed from the queue, and giving them `afkCheckDuration` to react to AFK Checks.
Example: `fcfs!cwr "Waiting Room 1" 10 5s 20s`

`(listwaitingrooms|lwr) [page]`  
Displays a paged list of waiting rooms on the server.

`(deletewaitingroom|dwr) "<monitorChannel>"`  
Deletes the waiting room associated with `monitorChannel`.

`info "<monitorChannel>"`  
Displays information about the waiting room associated with `monitorChannel`.

`(pingafk|ping|afkcheck) <mention>`  
DMs the mentioned user and disconnects them if they don\'t respond in time.

`(setrestrictedmode|srm) "<monitorChannel>" [on|off]`  
Sets whether only users with roles can use the pingafk command for users in `monitorChannel`.

`(addallowedrole|aar) "<monitorChannel>" <roleName>`  
Adds a role that can use pingafk if the target is in `monitorChannel`.

`(setfirstn|sfn) "<monitorChannel>" <firstN>`,  
`(setrejoinwindow|srw) "<monitorChannel>" <rejoinWindow>`,  
`(setafkcheckduration|sacd) "<monitorChannel>" <afkCheckDuration>`  
Changes settings for the waiting room associated with `monitorChannel`.