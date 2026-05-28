class CommentChannel < ApplicationCable::Channel
  def subscribed
    stream_from "comments"
  end

  def receive(data)
    text  = data["text"].to_s.slice(0, 100)
    color = data["color"].to_s.match?(/\A#[0-9a-fA-F]{6}\z/) ? data["color"] : "#ffffff"

    ActionCable.server.broadcast("comments", { text:, color: })
  end
end
