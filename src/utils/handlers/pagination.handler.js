import DBService from "../../db/service.db.js";

async function paginationHandler({
  model,
  filter = {},
  pageSize = 5,
  page = 1,
  sort = { createdAt: -1 },
  select = "",
  populate = [],
}) {
  pageSize = Number(pageSize);
  page = Number(page);

  const offset = pageSize * (page - 1);

  const [totalCount, dataItems] = await Promise.all([
    DBService.countDocuments({
      model,
      filter,
    }),
    DBService.find({
      model,
      filter,
      populate,
      select,
      sort,
      limit: pageSize,
      skip: offset,
    }),
  ]);

  return {
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
    pageSize,
    dataItems,
  }
}
export default paginationHandler;