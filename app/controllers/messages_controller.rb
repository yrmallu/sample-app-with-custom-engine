class MessagesController < ApplicationController
  # GET /messages/new
  def new
    @message = Message.new
  end
  # POST /messages
  # POST /messages.json
  def create
    @message = Message.new(message_params)

    respond_to do |format|
      if @message.valid?
        format.html { redirect_to root_url, notice: 'Message sent! Thank you for contacting us.' }
      else
        format.html { render action: 'new' }
      end
    end
  end

    # Never trust parameters from the scary internet, only allow the white list through.
    def message_params
      params.require(:message).permit(:name, :email, :content)
    end
end
