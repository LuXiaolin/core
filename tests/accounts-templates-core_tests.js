AccountsTemplates.init();


Tinytest.add("AccountsTemplates - addField/removeField", function(test) {
    // Calls after AccountsTemplates.init()
    AccountsTemplates._initialized = true;
    test.throws(function() {
        AccountsTemplates.addField('');
    }, function(err) {
        if (err instanceof Error && err.message === 'AccountsTemplates.addField should strictly be called before AccountsTemplates.init!')
            return true;
    });
    test.throws(function() {
        AccountsTemplates.removeField('');
    }, function(err) {
        if (err instanceof Error && err.message === 'AccountsTemplates.removeField should strictly be called before AccountsTemplates.init!')
            return true;
    });
    AccountsTemplates._initialized = false;

    // Trying to remove a non-existing field
    test.throws(function() {
        AccountsTemplates.removeField('foo');
    }, function(err) {
        if (err instanceof Error && err.message == 'A field called foo does not exist!')
            return true;
    });

    // Trying to remove an existing field
    AccountsTemplates.removeField('email');
    test.isUndefined(AccountsTemplates.getField('email'));
    // ...and puts it back in for tests re-run
    AccountsTemplates.addField({
        _id: "email",
        type: "email",
        displayName: "Email",
        required: true,
    });

    // Trying to add an already existing field
    test.throws(function() {
        var pwd = _.omit(AccountsTemplates.getField('password'), 'visible');
        AccountsTemplates.addField(pwd);
    }, function(err) {
        if (err instanceof Error && err.message == 'A field called password already exists!')
            return true;
    });

    var login = {
        _id: 'login',
        displayName: 'Email',
        type: 'email'
    };

    // Invalid field properties
    test.throws(function() {
        AccountsTemplates.addField(_.extend(_.clone(login), {
            foo: 'bar'
        }));
    }, Error);

    // Successful add
    AccountsTemplates.addField(login);
    // ...and removes it for tests re-run
    AccountsTemplates.removeField('login');

    // Invalid field.type
    test.throws(function() {
        AccountsTemplates.addField({
            _id: 'foo',
            displayName: 'Foo',
            type: 'bar'
        });
    }, function(err) {
        if (err instanceof Error && err.message == 'field.type is not valid!')
            return true;
    });

    // Invalid minLength
    test.throws(function() {
        AccountsTemplates.addField({
            _id: 'first-name',
            displayName: 'First Name',
            type: 'text',
            minLength: 0
        });
    }, function(err) {
        if (err instanceof Error && err.message == 'field.minLength should be greater than zero!')
            return true;
    });
    // Invalid maxLength
    test.throws(function() {
        AccountsTemplates.addField({
            _id: 'first-name',
            displayName: 'First Name',
            type: 'text',
            maxLength: 0
        });
    }, function(err) {
        if (err instanceof Error && err.message == 'field.maxLength should be greater than zero!')
            return true;
    });
    // maxLength < minLength
    test.throws(function() {
        AccountsTemplates.addField({
            _id: 'first-name',
            displayName: 'First Name',
            type: 'text',
            minLength: 2,
            maxLength: 1
        });
    }, function(err) {
        if (err instanceof Error && err.message == 'field.maxLength should be greater than field.maxLength!')
            return true;
    });

    // Successful add
    var first_name = {
        _id: 'first_name',
        displayName: 'First Name',
        type: 'text',
        minLength: 2,
        maxLength: 50,
        required: true
    };
    AccountsTemplates.addField(first_name);
    test.equal(AccountsTemplates.getField('first_name'), first_name);
    // Now removes it to be consistent with tests re-run
    AccountsTemplates.removeField('first_name');
});


Tinytest.add("AccountsTemplates - addFields", function(test) {
    // Fake uninitialized state...
    AccountsTemplates._initialized = false;

    if (Meteor.isClient) {
        // addFields does not exist client-side
        test.throws(function() {
            AccountsTemplates.addFields();
        });
    } else {
        // Not an array of objects
        test.throws(function() {
            AccountsTemplates.addFields('');
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });
        test.throws(function() {
            AccountsTemplates.addFields(100);
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });
        // Empty array
        test.throws(function() {
            AccountsTemplates.addFields([]);
        }, function(err) {
            if (err instanceof Error && err.message === 'field argument should be an array of valid field objects!')
                return true;
        });

        // Successful add
        var first_name = {
            _id: 'first_name',
            displayName: 'First Name',
            type: 'text',
            minLength: 2,
            maxLength: 50,
            required: true
        };
        var last_name = {
            _id: 'last_name',
            displayName: 'Last Name',
            type: 'text',
            minLength: 2,
            maxLength: 100,
            required: false
        };
        AccountsTemplates.addFields([first_name, last_name]);
        test.equal(AccountsTemplates.getField('first_name'), first_name);
        test.equal(AccountsTemplates.getField('last_name'), last_name);
        // Now removes ot to be consistend with tests re-run
        AccountsTemplates.removeField('first_name');
        AccountsTemplates.removeField('last_name');
    }
    // Restores initialized state...
    AccountsTemplates._initialized = true;
});


Tinytest.add("AccountsTemplates - setState/getState", function(test) {
    if (Meteor.isServer) {
        // getState does not exist server-side
        test.throws(function() {
            AccountsTemplates.getState();
        });
        // setState does not exist server-side
        test.throws(function() {
            AccountsTemplates.setState();
        });
    } else {
        // Setting 'Change Password'
        AccountsTemplates.setState('changePwd');
        test.equal(AccountsTemplates.getState(), 'changePwd');
        // Setting 'Enrol Account'
        AccountsTemplates.setState('enrolAccount');
        test.equal(AccountsTemplates.getState(), 'enrolAccount');
        // Setting 'Forgot Password'
        AccountsTemplates.setState('forgotPwd');
        test.equal(AccountsTemplates.getState(), 'forgotPwd');
        // Setting 'Reset Password'
        AccountsTemplates.setState('resetPwd');
        test.equal(AccountsTemplates.getState(), 'resetPwd');
        // Setting 'Sign In'
        AccountsTemplates.setState('signIn');
        test.equal(AccountsTemplates.getState(), 'signIn');
        // Setting 'Sign Up'
        AccountsTemplates.setState('signUp');
        test.equal(AccountsTemplates.getState(), 'signUp');
        // Setting an invalid state should throw a Meteor.Error
        test.throws(function() {
            AccountsTemplates.setState('foo');
        }, function(err) {
            if (err instanceof Meteor.Error && err.details == 'accounts-templates-core package got an invalid state value!')
                return true;
        });
    }
});


// -------------------------------------
// TODO: complite the following tests...
// -------------------------------------


Tinytest.add("AccountsTemplates - getFieldError/setFieldError", function(test) {
    if (Meteor.isServer) {
        // getFieldError does not exist server-side
        test.throws(function() {
            AccountsTemplates.getFieldError();
        });
        // setFieldError does not exist server-side
        test.throws(function() {
            AccountsTemplates.setFieldError();
        });
    } else {
        // TODO: write actual tests...
    }
});


Tinytest.add("AccountsTemplates - configure", function(test) {
    if (Meteor.isClient) {
        // configure does not exist client-side
        test.throws(function() {
            AccountsTemplates.configure({});
        });
    } else {
        // TODO: write actual tests...
    }
});
