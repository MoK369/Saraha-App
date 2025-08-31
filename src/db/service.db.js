const DBService = {
  findOne: async ({ model, filter = {}, select = "", populate = [] } = {}) => {
    return await model.findOne(filter).select(select).populate(populate);
  },
  findById: async ({ model, id, select = "", populate = [] } = {}) => {
    return await model.findById(id).select(select).populate(populate);
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
};

export default DBService;
