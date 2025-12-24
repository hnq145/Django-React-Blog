import moment from "moment";

function Moment(date) {
  return moment(date).format("NN TTTT, NNNN.");
}
export default Moment;
