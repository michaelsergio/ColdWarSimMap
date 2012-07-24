# A starter file for redirecting clean urls

require 'rubygems'
require 'sinatra'

set :static, true

get '/' do
  redirect 'map.html'
end

get '/about' do
  redirect 'about.html'
end
