/**
 * This is Sample function
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
    res.json({msg: 'You are your own limit!!', params: req.params, query: req.query});
};
