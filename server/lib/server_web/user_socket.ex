defmodule ServerWeb.UserSocket do
  use Phoenix.Socket

  ## Channels
  channel "room:lobby", ServerWeb.RoomChannel

  # Transport setup for websocket
  transport :websocket, Phoenix.Transports.WebSocket

  # Connect function that authorizes the user (optional)
  def connect(_params, socket, _connect_info) do
    {:ok, socket}
  end

  # Identifying the socket for use in channel routing
  def id(_socket), do: nil
end
