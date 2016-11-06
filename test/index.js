"use strict";
const server = require('../src/index');
const axiba_unit_test_1 = require('axiba-unit-test');
axiba_unit_test_1.describeClass('测试', server, () => {
    axiba_unit_test_1.itClass('run', () => {
        axiba_unit_test_1.itAdd([], value => true);
    });
    axiba_unit_test_1.itClass('getDevFile', () => {
        axiba_unit_test_1.itAdd([], value => true);
    });
});
axiba_unit_test_1.run();

//# sourceMappingURL=index.js.map
