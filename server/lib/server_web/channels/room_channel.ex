defmodule ServerWeb.RoomChannel do
  use ServerWeb, :channel

  def join("room:lobby", _message, socket) do
    {:ok, socket}
  end

  def handle_in("signal", %{"message" => message}, socket) do
    broadcast!(socket, "signal", %{message: message})
    {:noreply, socket}
  end
end
