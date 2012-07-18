require 'rubygems'
require 'sinatra'

get '/' do
  redirect '/visualize.html'
end

get '/alliances' do
  redirect '/alliance.html'
end
