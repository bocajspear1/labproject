db.createCollection('current_devices');
db.current_devices.ensureIndex({"uuid":1},{unique: true})
db.createCollection('registered_devices');
db.current_devices.ensureIndex({"uuid":1},{unique: true})
db.createCollection('device_groups');
db.device_groups.ensureIndex({"groupname":1},{unique: true})
db.createCollection('users');
db.users.ensureIndex({"username":1},{unique: true})
db.createCollection('groups');
db.groups.ensureIndex({"groupname":1},{unique: true})
db.createCollection('user_session');
db.user_session.ensureIndex({"username":1},{unique: true})
db.createCollection('labs')
db.labs.ensureIndex({"lab_id":1},{unique: true});
db.createCollection('isos')
db.isos.ensureIndex({"name":1},{unique: true});
db.createCollection('networks')
db.isos.ensureIndex({"name":1},{unique: true});
db.createCollection('registered_switches')
db.isos.ensureIndex({"sw_id":1},{unique: true});