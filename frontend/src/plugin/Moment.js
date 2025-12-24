import moment from "moment";
import "moment/locale/vi";

function Moment(date, lang) {
  return moment(date).locale(lang || 'en').format("DD MMMM, YYYY");
}

export default Moment;