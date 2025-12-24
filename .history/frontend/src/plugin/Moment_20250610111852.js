import moment from "moment";

function Moment(date) {
  return moment(date).format("MMM DD, YYYY.");
}
export default Moment;
