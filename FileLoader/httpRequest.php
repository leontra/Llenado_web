<?php
    #    
    #
    # Guardar JSON
    # 2016
    #
    #  
    
    class ServiciosEntrada 
	{
        private $error;
        function __construct()
		{ 
            $this->error = null;
        }

		function __destruct()
		{ }
        
        public function testService()
        { 
            if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['ActualizarData']))
	            echo $this->guardarDataToJSON();           
        }
        
        private function guardarDataToJSON()
        {         
            $postdata = file_get_contents("php://input");
    		$data = json_decode($postdata);
            $this->saveFile($data);

            return json_encode(array('status' => 1, 'message' => 'Se ha guardado la informacion'));                 
        }

        private function saveFile($modelo)
        {
            $fp = fopen('../db/registros.json', 'w');
            fwrite($fp, json_encode($modelo, JSON_PRETTY_PRINT));
            fclose($fp);
        }
    }
    
    function EntrarAlServicio()
	{
		$objeto = new ServiciosEntrada();
		$objeto->testService();
	}

	EntrarAlServicio();
?>