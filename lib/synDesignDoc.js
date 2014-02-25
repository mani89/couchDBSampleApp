var couchdb = require('couchdb')

var client  = couchdb.createClient(5984, '127.0.0.1');
var db      = client.db('formsapp');

var designDoc = {
  _id: '_design/forms',

  language: 'javascript',

  views: {
    'forms_by_date': {
      map: function(doc) {
        if (doc.type === 'forms') {
          emit(doc.postedAt, doc);
        }
      }.toString()
    }
  }
};

db.saveDoc(designDoc).then(function(resp) {
  console.log('updated design doc!');
}, function(err) {
  console.log('error updating design doc: '+require('util').inspect(err));
});
