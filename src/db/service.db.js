import { populate } from "dotenv";

const DBService = {
  find: async ({
    model,
    filter = {},
    select = "",
    populate = [],
    sort = {},
    limit,
    skip = 0,
  } = {}) => {
    return await model
      .find(filter)
      .select(select)
      .populate(populate)
      .sort(sort)
      .limit(limit)
      .skip(skip);
  },
  countDocuments: async ({ model, filter = {} } = {}) => {
    return await model.countDocuments(filter);
  },
  findOne: async ({ model, filter = {}, select = "", populate = [] } = {}) => {
    return await model.findOne(filter).select(select).populate(populate);
  },
  findById: async ({ model, id, select = "", populate = [] } = {}) => {
    return await model.findById(id).select(select).populate(populate);
  },
  findOneAndUpdate: async ({
    model,
    filter = {},
    update = {},
    options = { runValidators: true, new: true },
    select = "",
    populate = [],
  } = {}) => {
    return await model
      .findOneAndUpdate(
        filter,
        {
          ...update,
          $inc: {
            __v: 1,
          },
        },
        options
      )
      .select(select)
      .populate(populate);
  },
  updateOne: async ({
    model,
    filter = {},
    update = {},
    options = { runValidators: true },
    select = "",
    populate = [],
  } = {}) => {
    return await model
      .updateOne(filter, update, options)
      .select(select)
      .populate(populate);
  },
  create: async ({ model, docs = [], options = {} } = {}) => {
    return await model.create(docs, options);
  },
  deleteOne: async ({ model, filter = {}, options = {} }) => {
    return await model.deleteOne(filter, options);
  },
  deleteMany: async ({ model, filter = {}, options = {} }) => {
    return await model.deleteMany(filter, options);
  },
};

export default DBService;
