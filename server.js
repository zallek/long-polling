const express = require('express');
const path = require('path');
const EventEmitter = require('events').EventEmitter;


const exportList = [];
const exportListeners = [];

function updateExport(id) {
  const curentValue = exportList[id];
  var nextValue;
  var nextTimeout;

  // Update value
  if (!curentValue.status) {
    // Create export
    nextValue = {
      id,
      status: 'created',
    };
    nextTimeout = 2000;
  }
  else if (curentValue.status === 'created') {
    // Start processing
    nextValue = {
      id,
      status: 'processing',
      progress: 0,
    };
    nextTimeout = 500;
  }
  else if (curentValue.status === 'processing') {
    if (curentValue.progress < 100) {
      // Continue processing
      nextValue = {
        id,
        status: 'processing',
        progress: curentValue.progress + 20,
      };
      nextTimeout = 500;
    }
    else {
      // Finish
      nextValue = {
        id,
        status: 'done',
      };
    }
  }
  exportList[id] = nextValue;

  // Notify client
  if (exportListeners[id]) {
    exportListeners[id].json(nextValue);
    exportListeners[id] = null;
  }

  // Continue workflow
  if (nextTimeout) {
    setTimeout(() => updateExport(id), nextTimeout);
  }
};


// API

const app = express();
app.get('/export', function(req, res) {
  if (typeof req.query.id === 'undefined') {
    const exportId = exportList.push({}) - 1;
    exportListeners[exportId] = res;
    updateExport(exportId);
  } else {
    exportListeners[req.query.id] = res;
  }
});

app.get('/', function(req,res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});