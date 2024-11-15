const mongoose = require("mongoose");
const _ = require("lodash");

const loggerLib = require("./logger.lib");

async function connect(url) {
    if (_.isEmpty(url)) {
        throw new Error(`Missing args! url: ${url}`);
    }

    mongoose.set("strictQuery", false);
    await mongoose.connect(url);
    loggerLib.logInfo("MongoDB connected!");
}

async function insertOne(model, doc) {
    if (_.isNil(model) || _.isNil(doc)) {
        throw new Error(`Missing args! model: ${model}, doc: ${doc}`);
    }

    return await model.create(doc);
}

async function bulkWrite(model, operations) {
    if (_.isNil(model) || _.isEmpty(operations)) {
        throw new Error(`Missing args! model: ${model}, operations: ${operations}`);
    }

    return await model.bulkWrite(operations);
}

async function findOneWithHint(model, query, hint) {
    if (_.isNil(model) || _.isNil(query) || _.isNil(hint)) {
        throw new Error(
            `Missing args! model: ${model}, query: ${query}, hint: ${hint}`,
        );
    }

    return await model.findOne(query).hint(hint);
}

async function find(model, query) {
    if (_.isNil(model) || _.isNil(query)) {
        throw new Error(`Missing args! model: ${model}, query: ${query}`);
    }

    return await model.find(query);
}

async function findWithSkipLimit(model, query, skip, limit) {
    if (_.isNil(model) || _.isNil(query) || _.isNil(skip) || _.isNil(limit)) {
        throw new Error(
            `Missing args! model: ${model}, query: ${query}, skip: ${skip}, limit: ${limit}`,
        );
    }

    return await model.find(query).skip(skip).limit(limit);
}

async function findOneAndUpdate(model, filter, update, options) {
    if (_.isNil(model) || _.isNil(filter) || _.isNil(update) || _.isNil(options)) {
        throw new Error(
            `Missing args! model: ${model}, filter: ${filter}, update: ${update}, options: ${options}`,
        );
    }

    return await model.findOneAndUpdate(filter, update, options);
}

async function findWithSelect(model, query, select) {
    if (_.isNil(model) || _.isNil(query) || _.isNil(select)) {
        throw new Error(
            `Missing args! model: ${model}, query: ${query}, select: ${select}`,
        );
    }

    return await model.find(query).select(select);
}

module.exports = {
    find: find,
    connect: connect,
    insertOne: insertOne,
    bulkWrite: bulkWrite,
    findWithSelect: findWithSelect,
    findOneWithHint: findOneWithHint,
    findOneAndUpdate: findOneAndUpdate,
    findWithSkipLimit: findWithSkipLimit,
};
