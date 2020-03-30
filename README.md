First Come, First Serve
===

A Discord bot that enhances First Come, First Serve in voice channel waiting rooms. 

__Commands__  
default prefix: fcfs!

`(addadminrole|aar) <roleName>`
Adds a bot admin role.

`(removeadminrole|rar) <roleName>`
Removes a bot admin role.

`(listadminroles|lar)`
Lists bot admin roles.

`setprefix <prefix>`  
Changes the bot prefix in this server.

`(createwaitingroom|cwr) "<monitorChannel>" <firstN> <rejoinWindow> <afkCheckDuration>`  
Creates a monitor for the channel specified by `monitorChannel` that displays the first `firstN` users in the queue, allowing them `rejoinWindow` of time being disconnected before they\'re removed from the queue, and giving them `afkCheckDuration` to react to AFK Checks.
Example: `fcfs!cwr "Waiting Room 1" 10 5s 20s`

`(listwaitingrooms|lwr) [page]`  
Displays a list of waiting rooms on the server.

`(deletewaitingroom|dwr) "<monitorChannel>"`  
Deletes the waiting room associated with `monitorChannel`.

`info "<monitorChannel>"`  
Displays information about `monitorChannel`.

`(checkposition|position|p)`
Displays your place in queue.

`(setposition|sp) <member> <position>`
Sets a user\'s position in queue.

`(pingafk|ping|afkcheck) <mention>`  
DMs the mentioned user and disconnects them if they don\'t respond in time.

`(setrestrictedmode|srm) "<monitorChannel>" [on|off]`  
Sets whether only users with mod roles can use the pingafk command for users in `monitorChannel`.

`(addmodrole|aar) "<monitorChannel>" <roleName>`  
Adds a mod role for `monitorChannel`.

`(removemodrole|rmr) "<monitorChannel>" <roleName>`
Removes a mod role for `monitorChannel`.

`(listmodroles|lmr) "<monitorChannel>"`
Lists mod roles for `monitorChannel`.

`(setfirstn|sfn) "<monitorChannel>" <firstN>`,  
`(setrejoinwindow|srw) "<monitorChannel>" <rejoinWindow>`,  
`(setafkcheckduration|sacd) "<monitorChannel>" <afkCheckDuration>`  
Changes settings for the waiting room associated with `monitorChannel`.