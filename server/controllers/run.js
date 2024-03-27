const yapi = require('../yapi.js');
const baseController = require('./base.js');

const axios = require('axios')
const _ = require('lodash')

class RunController extends baseController {
    constructor(ctx) {
        super(ctx);
    }

    /**
     * 
     * @TODO: 最好用 child_process
     * @param {*} ctx 
     */
    async runCode(ctx) {
        const { options } = ctx.request.body
        try {
            const res = await axios(options)
            ctx.body = _.pick(res, ["data", "status", "statusText", "headers"])
        } catch (e) {
            ctx.body = _.pick(e.response, ["data", "status", "statusText", "headers"])
        }
    }


}
module.exports = RunController;
