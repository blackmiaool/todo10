// http://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    "parser": "vue-eslint-parser",
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module'
    },
    env: {
        browser: true,
    },
    // extends: 'airbnb-base',
    // required to lint *.vue files
    plugins: [
        'html', 'vue'
    ],

    // check if imports actually resolve
    'settings': {
        'import/resolver': {
            'webpack': {
                'config': 'build/webpack.base.conf.js'
            }
        }
    },
    // add your custom rules here
    'rules': {
        // don't require .vue extension when importing
        // 'import/extensions': ['error', 'always', {
        //     'js': 'never',
        //     'vue': 'never'
        // }],
        // allow optionalDependencies
        // 'import/no-extraneous-dependencies': ['error', {
        //     'optionalDependencies': ['test/unit/index.js']
        // }],
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        "indent": ["error", 4],
        "no-console": 0,
        "eqeqeq": 0,
        "comma-dangle": 0,
        "quotes": 0,
        "no-param-reassign": 0,
        "no-alert": 0,
        "func-names": 0
    }
}
