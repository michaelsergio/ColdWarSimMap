require 'rubygems'
require 'sinatra'

set :static, true

get '/' do
  haml :visualize
end
