var store, adapter;
var Person;

module("Attribute Changes and Dirtiness", {
  setup: function() {
    adapter = DS.Adapter.create();

    store = DS.Store.create({
      adapter: adapter
    });

    Person = DS.Model.extend({
      firstName: DS.attr('string')
    });
  }
});

test("By default, if a record's attribute is changed, it becomes dirty", function() {
  store.load(Person, { id: 1, firstName: "Yehuda" });
  var wycats = store.find(Person, 1);

  wycats.set('firstName', "Brohuda");

  ok(wycats.get('isDirty'), "record has become dirty");
});

test("If dirtyRecordsForAttributeChange does not add the record to the dirtyRecords set, it does not become dirty", function() {
  store.load(Person, { id: 1, firstName: "Yehuda" });
  var wycats = store.find(Person, 1);

  adapter.dirtyRecordsForAttributeChange = function(dirtyRecords, changedRecord, attributeName) {
    equal(changedRecord, wycats, "changed record is passed to hook");
    equal(attributeName, "firstName", "attribute name is passed to hook");
  };

  wycats.set('firstName', "Brohuda");

  ok(!wycats.get('isDirty'), "the record is not dirty despite attribute change");
});

test("If dirtyRecordsForAttributeChange adds the record to the dirtyRecords set, it becomes dirty", function() {
  store.load(Person, { id: 1, firstName: "Yehuda" });
  var wycats = store.find(Person, 1);

  adapter.dirtyRecordsForAttributeChange = function(dirtyRecords, changedRecord, attributeName) {
    equal(changedRecord, wycats, "changed record is passed to hook");
    equal(attributeName, "firstName", "attribute name is passed to hook");
    dirtyRecords.add(changedRecord);
  };

  wycats.set('firstName', "Brohuda");

  ok(wycats.get('isDirty'), "the record is dirty after attribute change");
});

test("If dirtyRecordsForAttributeChange adds a different record than the changed record to the dirtyRecords set, the different record becomes dirty", function() {
  store.load(Person, { id: 1, firstName: "Yehuda" });
  store.load(Person, { id: 2, firstName: "Tom" });
  var wycats = store.find(Person, 1);
  var tomdale = store.find(Person, 2);

  adapter.dirtyRecordsForAttributeChange = function(dirtyRecords, changedRecord, attributeName) {
    equal(changedRecord, wycats, "changed record is passed to hook");
    equal(attributeName, "firstName", "attribute name is passed to hook");
    dirtyRecords.add(tomdale);
  };

  wycats.set('firstName', "Brohuda");

  ok(tomdale.get('isDirty'), "the record is dirty after attribute change");
  ok(!wycats.get('isDirty'), "the record is not dirty after attribute change");
});

test("If dirtyRecordsForAttributeChange adds two records to the dirtyRecords set, both become dirty", function() {
  store.load(Person, { id: 1, firstName: "Yehuda" });
  store.load(Person, { id: 2, firstName: "Tom" });
  var wycats = store.find(Person, 1);
  var tomdale = store.find(Person, 2);

  adapter.dirtyRecordsForAttributeChange = function(dirtyRecords, changedRecord, attributeName) {
    equal(changedRecord, wycats, "changed record is passed to hook");
    equal(attributeName, "firstName", "attribute name is passed to hook");
    dirtyRecords.add(tomdale);
    dirtyRecords.add(wycats);
  };

  wycats.set('firstName', "Brohuda");

  ok(tomdale.get('isDirty'), "the record is dirty after attribute change");
  ok(wycats.get('isDirty'), "the record is dirty after attribute change");
});
