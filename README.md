# UAV

Scans each VK group, looking for people from the list.
It also creates a server to control the app at the runtime by HTTP requests.

# INSTRUCTION
1. node initConfig.js for config and state initialization
2. Create Standalone Application in VK https://vk.com/editapp?act=create
3. Copy its Service token to app/config/state.json. Field `token`
4. In `targets` field put user ids to observe
5. node index.js
6. There will be control server on 3000 port by default


# SERVER API

* `POST /start` - Start scanning
* `POST /stop` - Pause scanning
* `GET /intel` - Get current intelligence
* `GET /state` - Get current state
* `PUT/PATCH /intel` - Change intelligence (whole/partly)
* `PUT/PATCH /state` - Change state (whole/partly)


# CONFIGURATION
### app/config/config.json

* `server` - Should the control server be launched
* `port: 3000` - Control server port
* `autoSaveTime` - Interval in ms, autosaving state and intel in json

# STATE
### app/config/state.json
Application state. Can be changed in a runtime by control server methods.

* `lastGid` - Last scanned group id. Start scanning from it on start
* `targets` - User id list for observation
* `isActive` - Is scanning enabled or paused.
* `token` - Token for VK api methods.
* `endGid` - Mostly a read-only service field. Keeping the last max group id.

### app/config/intelligence.json
Collected user data. Can be changed in a runtime by control server methods.

Structure:
```
[user id]: [
   [group id]: timestamp,
   [group id]: timestamp
],
[user id]: [
   [group id]: timestamp
]
```
Each user has a list of groups in which he was at `timestamp` time.
If user left the group he was before such entry will be deleted.

# TODO

* Control server authorization (JWT)
* Private groups filtering
* Tests
* Logger
* Better english
