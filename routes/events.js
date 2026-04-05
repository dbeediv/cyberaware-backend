import express from "express"
import supabase from "../db/index.js"

const router = express.Router()

router.get("/api/events/live", async (req, res) => {
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  res.json(data)
})

export default router
