const TextUtils = require("./TextUtils");
const createError = require("../models/Error");
module.exports = {
    findWithSkipAndLimit: (
    req,
    res,
    model,
    listningQuery = {},
    pageNumber = 0,
    limit = 10,
    callback = null
  ) => {
    pageNumber = TextUtils.isZeroOrNegative(pageNumber)
      ? 1
      : Number(pageNumber);
    limit = TextUtils.isZeroOrNegative(limit) ? 10 : limit;

    model.find(listningQuery).then((data) => {
        console.log(data.length);
      if (data.length > 0) {
        let totalRecord = data.length;

        model
          .find(listningQuery)
          .skip(limit * (pageNumber - 1))
          .limit(limit)
          .then((data) => {
            data = {
              data: data,
              page_number: pageNumber,
              page_size: limit,
              data_count: data.length,
              upper_index: limit * (pageNumber - 1) + 1,
              lower_index: limit * (pageNumber - 1) + data.length,
              total_record: totalRecord,
              is_first_record_set: pageNumber === 1 ? true : false,
              is_last_record_set:
                limit * pageNumber >= totalRecord ? true : false,
            };
 
            
            if (callback === null) {
             
              if (data.data.length > 0) {
           
                res.status(200).json(data);
              } else {
                res.status(204).json(createError(204, "data not found"));
              }
            } else {
              callback(data);
            }
          });
      } else {
        res.status(204).json(createError(204, "data not found"));
      }
    });
  },}