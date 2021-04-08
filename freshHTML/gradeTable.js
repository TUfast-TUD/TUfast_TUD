const table_html = '<div id="table"> \
<vs-table stripe :data="table"> \
  <template slot="header"> \
	<h1>Deine Notenübersicht</h1> \
  </template> \
 \
  <template slot="thead"> \
	<vs-th v-for="(header_text, index) in table[1]"  :sort-key="`${index}`" :key="index"> {{header_text}} </vs-th> \
  </template> \
 \
  <template slot-scope="{data}"> \
	<vs-tr :state="getColour(indextr, tr)" :key="indextr" v-for="(tr, indextr) in data.slice(2)"> \
	  <vs-td v-for="(td, index) in tr" :key="index" :data="td"> {{td}} </vs-td> \
	</vs-tr> \
  </template> \
</vs-table> \
</div>'