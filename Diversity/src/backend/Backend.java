package backend;

import java.sql.SQLException;
import org.json.*;

import importDB.Data;

public class Backend {
	private int op = 0;
	private JSONObject msg;

	public Backend(int _op, JSONObject _msg) {
		op = _op;
		msg = _msg;

	}

	public String resolve() {

		try {
			switch (op) {
			case 1:
				SentimentChart sc = new SentimentChart();
				return sc.chartrequest().toString();
			case 2:
				Data dat = new Data();
				try {
					dat.load();
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				return "LOADED SUCCESSFULLY";
			case 3:
				Globalsentiment gs = new Globalsentiment();

				String param, values;

				param = (msg.has("param")) ? msg.getString("param") : null;
				values = (msg.has("values")) ? msg.getString("values") : null;

				return gs.globalsentiment(1, 5, param, values).toString();
			case 4:
				// session.getBasicRemote().sendText(be
				// .globalsentiment(1, 5, msg.getString("param"),
				// msg.getString("values")).toString());
				// break;
			default:

			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "Mistake";
	}

}