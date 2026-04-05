import express from "express"
import supabase from "../db/index.js"
import { getScoreDelta } from "../utils/scoring.js"

const router = express.Router()

router.get("/track", async (req, res) => {
  const uid = req.query.uid
  const event = req.query.event

  if (!uid || !event) {
    return res.send("Missing uid or event")
  }

  // Save event
  await supabase.from("events").insert({
    user_id: uid,
    event_type: event
  })

  // Update score
  const change = getScoreDelta(event)

  if (change !== 0) {
    const { data } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", uid)
      .single()

    const newScore = (data?.score || 0) + change

    await supabase.from("scores").upsert({
      user_id: uid,
      score: newScore
    })
  }

  res.send("Tracked")
})

export default router
