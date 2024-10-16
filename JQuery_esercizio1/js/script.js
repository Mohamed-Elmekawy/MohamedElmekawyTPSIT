$(document).ready( function() {

   z=5;
   for(i=0;i<z;i++)
   {

      nuovo = document.createElement('div');
      nuovo.setAttribute('id', 'd'+i);
      nuovo.setAttribute('class', 'miediv');
      nuovo.setAttribute('verso', '0');
      $("body").append(nuovo);

      l=10+(i*40);
      t=10;

      $("#d"+i).css({'top':t,'left':l});
      $("#d"+i).attr('verso',1);
	  
      $("#d"+i).click( function() {
         nt = parseInt($(this).css('top'));
         v = parseInt($(this).attr('verso'));
         nt = nt + 40*v;
         $(this).css({ 'top':nt });
		 
		 
         if(nt>200 && v==1)
         {
            $(this).attr('verso',-1);
         }
         if(nt<11 && v==-1)
         {
            $(this).css({'background-color':'rgb(200,0,0)'});
   	    for(i=0;i<z;i++)
            {
               $("#d"+i).attr('verso',0);
            } 
         }
      });
   }
   
});   

