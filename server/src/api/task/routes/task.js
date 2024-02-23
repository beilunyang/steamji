module.exports = {
  prefix: '/tasks',
  routes: [
    {
     method: 'POST',
     path: '/finish/share',
     handler: 'task.finishShareTask',
    },
  ],
};
