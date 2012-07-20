require 'rubygems'
require 'sinatra'
require 'haml'

set :static, true

get '/' do
  redirect 'map.html'
end

# cache the world map
get '/worldmap.svg' do
  response['Cache-Control'] = "public, max-age=#{24 * 60 * 60}"
  content_type "image/svg+xml"
  File.read(File.join('public', 'BlankMap-World6.svg'))
end

  
