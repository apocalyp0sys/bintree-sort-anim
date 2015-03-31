$(function() {
   // Tree leaf class. Strycture of this classes represents a tree
   var TreeLeaf = function (value, color) {
      this.rightBranch = null;
      this.leftBranch = null;
      this.hilightPath = true;
      this.hilightNode = true;
      this.color = color;
      this.val = value;
      this.id = 0;
   };

   // Add element to a tree
   TreeLeaf.prototype.insert = function (val) {
      this.hilightPath = true;
      var branch = '';
      var isRightBranch = false;
      if (this.val < val) {
         branch = 'rightBranch';
         isRightBranch = true;
      } else {
         branch = 'leftBranch'
      }


      if (this[branch] != null) {
         this[branch].insert(val)
      } else {
         this[branch] = new TreeLeaf(val, isRightBranch ? 'steelblue' : 'green');

         //children property is used for d3.js compatibility
         if (this.children === undefined) {
            this.children = [];
         }
         isRightBranch ? this.children.push(this[branch]) : this.children.unshift(this[branch]);

         update(this[branch]);
      }

      T.clearHighlights()

   };

   // walk through tree and apply a function to each node
   TreeLeaf.prototype.walk = function (func) {
      if (this.leftBranch != null) {
         this.leftBranch.walk(func)
      }

      if(typeof func === 'function') {
         func(this)
      }

      if (this.rightBranch != null) {
         this.rightBranch.walk(func);
      }
   };

   // clears highlight flags on elements between animation steps
   TreeLeaf.prototype.clearHighlights = function(){
      if (this.leftBranch != null) {
         this.leftBranch.clearHighlights()
      }

      this.hilightPath = false;
      this.hilightNode = false;

      if (this.rightBranch != null) {
         this.rightBranch.clearHighlights();
      }
   };

   // handle svg elements and transitions  when a new element (if any) is added to a tree
   function update(nodeToAdd) {
      if (nodeToAdd !== undefined) {
         nodeToAdd.id = nodes.length;
         nodes.push(nodeToAdd);
      }

      // Recompute the layout and data join.
      node = node.data(tree.nodes(root), function (d) {
         return d.id;
      });
      link = link.data(tree.links(nodes), function (d) {
         return d.source.id + "-" + d.target.id;
      });


      // Add entering nodes in the parent’s old position.
      var nodeEnter = node.enter().append("g")
         .attr("class", "node");

      nodeEnter.append("circle")
         .attr("class", "node")
         .attr("r", function (d) {
            return 10 + Math.floor(d.val / 10);
         })
         .attr("cx", function (d) {
            return d.parent.px;
         })
         .attr("cy", function (d) {
            return d.parent.py;
         });

      // add text labels appearing on top
      nodeEnter.append("text")
         .attr("class", "text")
         .attr("x", function (d) {
            return (nodes.length - 1) * 26;
         })
         .attr("y", function (d) {
            return 0;
         })
         .attr("text-anchor", "middle")
         .text(function (d) {
            return d.val;
         });

      // add links between nodes
      link.enter().insert("path", ".node")
         .attr("class", "link")

         .attr("d", function (d) {
            var o = {x: d.source.px, y: d.source.py};
            return diagonal({source: o, target: o});
         });

      // Transition nodes and links to their new positions.
      var t = svg.transition()
         .duration(400);

      t.selectAll(".link")
         .attr("d", diagonal).style('stroke', function (d) {
            return d.target.hilightPath ? '#f00' : '#ccc';
         });

      t.selectAll(".node")
         .attr("cx", function (d) {
            return d.px = d.x;
         })
         .attr("cy", function (d) {
            return d.py = d.y;
         });


      t.selectAll("circle").style('stroke', function (d) {
         return d.hilightNode ? '#f00' : d.color;
      });

      t.selectAll(".text")
         .attr("x", function (d) {
            return d.x;
         })
         .attr("y", function (d) {
            return d.y + 4;
         });
   }

   // handle elements and transitions when walking through tree
   function updateOut(id) {

      var textOld = d3.selectAll('text').filter(function (d) {
         if (d !== undefined && id == d.id) {
            return d;
         }
      });

      var textToCopy = textOld.data()[0];

      var circle = d3.selectAll('circle').filter(function (d) {
         if (id == d.id) {
            return d;
         }
      });


      $('body').queue('mainAnimation', function () {

         var text = svg.append("text")
            .attr("class", "text-out")
            .attr("x", textToCopy.x)
            .attr("y", textToCopy.y)
            .attr("text-anchor", "middle")
            .text(textToCopy.val);

         circle.transition().duration(400).style("fill", "silver");

         text.transition().duration(400).attr("x", "10")
            .attr("y", "475");

         text.transition().delay(400).duration(200).style('opacity', 0);

         // extract value from tree and append to sorted values
         var numb = textToCopy.val;
         $('<div>' + numb + '</div>').prependTo($('#sortedValues')).animate({width: '20'});
      });

   }
   // generate an array for sorting
   var arrayToSort = [];
   for (var i = 0; i < 38; i++) {
      var randomVal = Math.floor(Math.random() * 100);
      arrayToSort.push(randomVal);
      $('#unsortedValues').append($('<div>'+ randomVal +'</div>'))
   }
   // create a tree and add a root value
   var T = new TreeLeaf(arrayToSort.shift());

   var margin = {top: 20, right: 10, bottom: 20, left: 10};

   var width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

   var svg = d3.select("div#svgContainer").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   var tree = d3.layout.tree()
      .size([width - 20, height - 20]);

   var root = T,
      nodes = tree(root);

   root.parent = root;
   root.px = root.x;
   root.py = root.y;

   var diagonal = d3.svg.diagonal();


   var node = svg.selectAll(".node"),
      link = svg.selectAll(".link");

   // start sorting and animations
   function initSort() {
      $('div',$('#unsortedValues')).first().css('background-color','#ff0');

      update();

      arrayToSort.forEach(function (elem, idx) {

         $('body').queue('mainAnimation', function () {
            $('div:nth-child(' + (idx + 2) + ')', $('#unsortedValues')).css('background-color', '#ff0');
            T.insert(elem);
         });

      });


      $('body').queue('mainAnimation', function () {

         T.clearHighlights();
         update();
         T.walk(function (leaf) {
            updateOut(leaf.id);

         })
      });


      setInterval(function () {
         $('body').dequeue('mainAnimation')
      }, 600);
   }
   // bind functions to button events
   $('button#start').click(function(){
      $(this).attr('disabled','disabled');
      initSort();
   });

   $('button#reset').click(function(){
      location.reload();
   });

   $('button#desctiption').click(function(){
      $('div#descriptionText').toggle(400);
   });
});