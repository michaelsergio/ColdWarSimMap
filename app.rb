require 'rubygems'
require 'sinatra'

set :static, true

get '/' do
  redirect '/visualize.html'
end
