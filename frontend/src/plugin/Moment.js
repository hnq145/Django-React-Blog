import moment from "moment";
import "moment/locale/vi";

function Moment(date, lang) {
  const locale = lang === "vi" ? "vi" : "en";
  if (locale === "vi") {
    return moment(date).locale("vi").format("DD [Tháng] MM, YYYY");
  }
  return moment(date).locale("en").format("DD MMMM, YYYY");
}

export default Moment;
