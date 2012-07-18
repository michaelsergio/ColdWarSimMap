require "rubygems"
require "bundler/setup"
Bundler.require(:default)

filename = 'BlankMap-World6.svg'

# nokogiri doesn't seem to like svgs
# so I'm going with old fashioned
# on string replacement
file = File.open(filename, 'r')
contents = file.read
lines = contents.split("\n")

beginning = lines[0..13]
ending = lines[152..lines.length]

#style = file_doc.search('#style_css_sheet')[0]
#style.content = ".gb, .au, .nc {fill: #ff0000;}"

middle = ".gb, .au, .nc {fill: #ff0000;}"
common = """
/*
 * Below are Cascading Style Sheet (CSS) definitions in use in this file,
 * which allow easily changing how countries are displayed.
 *
 */

/*
 * Circles around small countries
 *
 * Change opacity to 1 to display all circles.
 *
 */
.circlexx
{
   opacity:0;
   fill:#e0e0e0;
   stroke:#000000;
   stroke-width:0.5;
}

/*
 * Smaller circles around French DOMs and Chinese SARs
 *
 * Change opacity to 1 to display all subnational circles.
 *
 */
.subxx
{
   opacity:0;
   stroke-width:0.3;
}

/*
 * Circles around small, unrecognized countries
 *
 * Change opacity to 1 to display all circles.
 *
 */
.unxx
{
   opacity:0;
   fill:#e0e0e0;
   stroke:#000000;
   stroke-width:0.3;
}

/*
 * Circles around small countries, but with no permanent residents 
 *
 * Change opacity to 1 to display all circles.
 *
 */
.noxx
{
   opacity:0;
   fill:#e0e0e0;
   stroke:#000000;
   stroke-width:0.5;
}

/*
 * land
 */
.landxx
{
   fill: #e0e0e0;
   stroke:#ffffff;
   stroke-width:0.5;
   fill-rule:evenodd;
}

/*
 * Styles for coastlines of islands with no borders
 */
.coastxx
{
   fill: #e0e0e0;
   stroke:#ffffff;
   stroke-width:0.3;
   fill-rule:evenodd;
}

/*
 * Styles for nations with limited recognition
 */
.limitxx
{
   fill: #e0e0e0;
   stroke:#ffffff;
   stroke-width:0;
   fill-rule:evenodd;
}

/*
 * Styles for nations with no permanent population.
 */
.antxx
{
   fill: #e0e0e0;
   stroke:#ffffff;
   stroke-width:0;
   fill-rule:evenodd;
}

/*
 * Ocean
 */
.oceanxx
{
   opacity: 1;
   color: #000000;
   fill:#ffffff;
   stroke:#000;
   stroke-width:0.5;
   stroke-miterlimit:1;
}
"""

new_doc = "#{beginning.join("\n")}#{common}\n#{middle}#{ending.join("\n")}"

colored_map = File.new('newmap.svg', 'w')
colored_map.puts new_doc

