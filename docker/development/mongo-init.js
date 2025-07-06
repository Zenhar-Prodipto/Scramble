db = db.getSiblingDB('scramble_dev');

db.createUser({
  user: 'scramble_user',
  pwd: 'scramble_password',
  roles: [
    {
      role: 'readWrite',
      db: 'scramble_dev'
    }
  ]
});

db.projects.createIndex({ "name": 1 });
db.projects.createIndex({ "createdBy": 1 });
db.boards.createIndex({ "projectId": 1 });
db.tasks.createIndex({ "boardId": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.users.createIndex({ "email": 1 }, { unique: true });
