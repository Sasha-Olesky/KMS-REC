App.controller('StreamCtrl', function($scope, $http, $interval) {
    $scope.videoList = [];
    $scope.streamingTitle;
    $scope.recorder;
    $scope.pipeline;
    $scope.webRtcPeer;
    $scope.videoInput;
    $scope.videoOutput;


    /* get video list from server */
    $scope.getVideoList = function() {
    	$http({
    	  method: 'GET',
    	  url: 'https://dev.brightguide.ca:8081/videolist'
    	}).then(function successCallback(response) {
    		var obj = JSON.parse(response.data);
    		$scope.videoList = angular.fromJson(obj);
	  }, function errorCallback(response) {
	  });
    };

    /* getting video list in realtime */
    //$interval($scope.getVideoList, 5000);
    //$scope.getVideoList();

    $scope.playVideo = function(fileUri) {
	     console.log("playing video =====> " + fileUri);	
	     startPlaying(fileUri);
    };
    
    /* start record */
    $scope.startRecording = function() {
        startRecording();
    }

   /* stop record and play */
    $scope.stopRecordAndPlay = function() {
	$scope.recorder.stop();
                    $scope.pipeline.release();
                    $scope.webRtcPeer.dispose();
                    $scope.videoInput.src = "";
                    $scope.videoOutput.src = "";

                    hideSpinner($scope.videoInput, $scope.videoOutput);
        
	$scope.getVideoList();
    } 

    getopts = function (args, opts)
    {
      var result = opts.default || {};
      args.replace(
          new RegExp("([^?=&]+)(=([^&]*))?", "g"),
          function($0, $1, $2, $3) { result[$1] = decodeURI($3); });

      return result;
    };

    args = getopts(location.search,
    {
      default:
      {
        ws_uri: 'wss://' + location.hostname + ':8433/kurento',
        file_uri: 'file:///tmp/' + $scope.streamingTitle + '.webm', // file to be stored in media server
        ice_servers: undefined
        //ice_servers: ["stun:stun.l.google.com:19302"]
      }
    });

    setIceCandidateCallbacks = function (webRtcPeer, webRtcEp, onerror)
    {
      webRtcPeer.on('icecandidate', function(candidate) {
        console.log("Local candidate:",candidate);

        candidate = kurentoClient.getComplexType('IceCandidate')(candidate);

        webRtcEp.addIceCandidate(candidate, onerror)
      });

      webRtcEp.on('OnIceCandidate', function(event) {
        var candidate = event.candidate;

        console.log("Remote candidate:",candidate);

        webRtcPeer.addIceCandidate(candidate, onerror);
      });
    }

    formatDate = function (dateObj,format)
    {
        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        var curr_date = dateObj.getDate();
        var curr_month = dateObj.getMonth();
        curr_month = curr_month + 1;
        var curr_year = dateObj.getFullYear();
        var curr_min = dateObj.getMinutes();
        var curr_hr= dateObj.getHours();
        var curr_sc= dateObj.getSeconds();
        if(curr_month.toString().length == 1)
        curr_month = '0' + curr_month;      
        if(curr_date.toString().length == 1)
        curr_date = '0' + curr_date;
        if(curr_hr.toString().length == 1)
        curr_hr = '0' + curr_hr;
        if(curr_min.toString().length == 1)
        curr_min = '0' + curr_min;

        if(format ==1)//dd-mm-yyyy
        {
            return curr_date + "-"+curr_month+ "-"+curr_year;       
        }
        else if(format ==2)//yyyy-mm-dd
        {
            return curr_year + "-"+curr_month+ "-"+curr_date;       
        }
        else if(format ==3)//dd/mm/yyyy
        {
            return curr_date + "/"+curr_month+ "/"+curr_year;       
        }
        else if(format ==4)// MM/dd/yyyy HH:mm:ss
        {
            return curr_month+"_"+curr_date +"_"+curr_year+ " "+curr_hr+"_"+curr_min+"_"+curr_sc;       
        }
    }


    startRecording = function () {
      console.log("onClick");

      /* prompt video title  */
      var title = prompt("Please input streaming title");
      var timeStamp = formatDate(new Date(),4);
      if (title == null || title == "") {
          $scope.streamingTitle = "Streaming__" ;
      } else {
          $scope.streamingTitle = title + "__";
      }
      $scope.streamingTitle = $scope.streamingTitle + timeStamp;

      args = getopts(location.search,
      {
        default:
        {
          ws_uri: 'wss://' + location.hostname + ':8433/kurento',
          file_uri: 'file:///tmp/' + $scope.streamingTitle + '.webm', // file to be stored in media server
          ice_servers: undefined
          //ice_servers: ["stun:stun.l.google.com:19302"]
        } 
      });

      $scope.videoInput = document.getElementById("videoInput");
      $scope.videoOutput = document.getElementById("videoOutput");

      showSpinner($scope.videoInput, $scope.videoOutput);

      var stopRecordButton = document.getElementById("stop")

      var options = {
        localVideo: $scope.videoInput,
        remoteVideo: $scope.videoOutput
      };

      if (args.ice_servers) {
        console.log("Use ICE servers: " + args.ice_servers);
        options.configuration = {
          iceServers : JSON.parse(args.ice_servers)
        };
      } else {
        console.log("Use freeice")
      }

      $scope.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error)
      {
        if(error) return onError(error)

        this.generateOffer(onOffer)
      });

      onOffer = function (error, offer) {
        if (error) return onError(error);

        console.log("Offer...");

        kurentoClient(args.ws_uri, function(error, client) {
          if (error) return onError(error);

          client.create('MediaPipeline', function(error, pipeline) {
            $scope.pipeline = pipeline;
            if (error) return onError(error);

            console.log("Got MediaPipeline");

            var elements =
            [
              {type: 'RecorderEndpoint', params: {uri : args.file_uri}},
              {type: 'WebRtcEndpoint', params: {}}
            ]

            $scope.pipeline.create(elements, function(error, elements){
              if (error) return onError(error);

              $scope.recorder = elements[0]
              webRtc   = elements[1]

              setIceCandidateCallbacks($scope.webRtcPeer, webRtc, onError)

              webRtc.processOffer(offer, function(error, answer) {
                if (error) return onError(error);

                console.log("offer");

                webRtc.gatherCandidates(onError);
                $scope.webRtcPeer.processAnswer(answer);
              });

              client.connect(webRtc, webRtc, $scope.recorder, function(error) {
                if (error) return onError(error);

                console.log("Connected");

                $scope.recorder.record(function(error) {
                  if (error) return onError(error);

                  console.log("record");

                  stopRecordButton.addEventListener("click", function(event){
                    $scope.recorder.stop();
                    $scope.pipeline.release();
                    $scope.webRtcPeer.dispose();
                    $scope.videoInput.src = "";
                    $scope.videoOutput.src = "";

                    hideSpinner($scope.videoInput, $scope.videoOutput);
        
        angular.element(document.getElementById('stop')).scope().getVideoList();
                    /*var playButton = document.getElementById('play');
        var fileUri = 'file:///tmp/' + streamingTitle + '.webm';
                    playButton.addEventListener('click', startPlaying(fileUri));*/
                  });
                });
              });
            });
          });
        });
      }
    }


    startPlaying = function (filePath)
    {
      console.log("Start playing");
      filePath = 'file:///tmp/' + filePath;
      var videoPlayer = document.getElementById('videoOutput');
      showSpinner(videoPlayer);

      var options = {
        remoteVideo: videoPlayer
      };

      if (args.ice_servers) {
        console.log("Use ICE servers: " + args.ice_servers);
        options.configuration = {
          iceServers : JSON.parse(args.ice_servers)
        };
      } else {
        console.log("Use freeice")
      }

      $scope.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      function(error)
      {
        if(error) return onError(error)

        this.generateOffer(onPlayOffer)
      });

      onPlayOffer = function (error, offer) {
        if (error) return onError(error);

        kurentoClient(args.ws_uri, function(error, client) {
          if (error) return onError(error);

          client.create('MediaPipeline', function(error, pipeline) {
            if (error) return onError(error);
            $scope.pipeline = pipeline;

            $scope.pipeline.create('WebRtcEndpoint', function(error, webRtc) {
              if (error) return onError(error);

              setIceCandidateCallbacks($scope.webRtcPeer, webRtc, onError)

              webRtc.processOffer(offer, function(error, answer) {
                if (error) return onError(error);

                webRtc.gatherCandidates(onError);

                $scope.webRtcPeer.processAnswer(answer);
              });

    //          var options = {uri : args.file_uri}
      console.log("file_uri ===>" + filePath);
       var options = {uri: filePath};

              $scope.pipeline.create("PlayerEndpoint", options, function(error, player) {
                if (error) return onError(error);

                player.on('EndOfStream', function(event){
                  $scope.pipeline.release();
                  videoPlayer.src = "";

                  hideSpinner(videoPlayer);
                });

                player.connect(webRtc, function(error) {
                  if (error) return onError(error);

                  player.play(function(error) {
                    if (error) return onError(error);
                    console.log("Playing ...");
                  });
                });

                document.getElementById("stop").addEventListener("click",
                function(event){
                  $scope.pipeline.release();
                  $scope.webRtcPeer.dispose();
                  videoPlayer.src="";

                  hideSpinner(videoPlayer);

                })
              });
            });
          });
        });
      };
    }

    onError = function (error) {
      if(error) console.log(error);
    }

    showSpinner = function () {
      for (var i = 0; i < arguments.length; i++) {
        arguments[i].poster = 'assets/img/transparent-1px.png';
        arguments[i].style.background = "center transparent url('assets/img/spinner.gif') no-repeat";
      }
    }

    hideSpinner = function () {
      for (var i = 0; i < arguments.length; i++) {
        arguments[i].src = '';
        arguments[i].poster = 'assets/img/webrtc.png';
        arguments[i].style.background = '';
      }
    }

    /**
     * Lightbox utility (to display media pipeline image in a modal dialog)
     */
    $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
      event.preventDefault();
      $(this).ekkoLightbox();
    });

});



