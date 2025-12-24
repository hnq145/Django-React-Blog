import moment from "moment";
import "moment/locale/vi";

function Moment(date) {
  moment.locale("vi");
  return moment(date).format("DD MMMM, YYYY");
}

export default Moment;
