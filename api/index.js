import app from "../backend/src/server";
export default function handler(req, res) {
  return app(req, res);
}
