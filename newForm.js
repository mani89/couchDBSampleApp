var bogart = require('bogart');
var couchdb = require('couchdb');

var client     = couchdb.createClient(5984, '127.0.0.1')
  , db         = client.db('formsapp')
  , viewEngine = bogart.viewEngine('mustache')
  , router     = bogart.router();

router.get('/', function(req) {
  return bogart.redirect('/forms');
});


router.get('/forms', function(req) {

  return db.view('forms', 'forms_by_date').then(function(resp) {
    var forms = resp.rows.map(function(x) { return x.value; });

    return viewEngine.respond('forms.html', {
      locals: {
        forms: forms
      }
    });
  }, function(err) {
    if (err.error && err.error === 'not_found') {
      return bogart.error('execute syncDesignDoc');
    }
    throw err;
  });
});


router.get('/forms/new', function(req) {
  return viewEngine.respond('newForm.html', {
    locals: {
      title: 'New Form'
    }
  });
});

router.get('/forms/:id', function(req) {
  return db.openDoc(req.params.id).then(function(form) {
    return viewEngine.respond('thisForm.html', { locals:form});
  });
});

router.post('/forms', function(req) {
  var forms = req.params;
  forms.type = 'forms';
  forms.postedAt = new Date();

  return db.saveDoc(forms).then(function(resp) {
    return bogart.redirect('/forms');
  });
});


var app = bogart.app();

// Include batteries, a default JSGI stack.
app.use(bogart.batteries);

// Include our router, it is significant that this is included after batteries.
app.use(router);

app.start();
