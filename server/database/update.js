'use strict';

/*
 * @see http://apidocs.strongloop.com/loopback-datasource-juggler/#datasource-prototype-autoupdate
 */
global.isUpdatingDataBase = true;
const server = require('../server.js');

// datasources names is provided by the gig.yaml
const datasources = ['mysqlDS'];
datasources.forEach(name => {
  const datasource = server.dataSources[name];
  if (datasource) {
    console.log(`Updating database for datasource ${name}`);
    datasource.autoupdate((error, result) => {
      if (error) {
        console.log('An error occured updating the database ' + error);
        throw error;
      }
      console.log('Database update done');
      datasource.disconnect(process.exit);
    });
  }
});