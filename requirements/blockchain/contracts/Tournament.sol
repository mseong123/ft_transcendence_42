// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.13;

contract Tournament {
    struct Match {
        uint256 matchId;
        uint256 team1Score;
        uint256 team2Score;
        bool created;
    }

    struct TournamentInfo {
        uint256 tournamentId;
        uint256[] matchIds;
        bool created;

        // matches is mapped to Match struct
        mapping(uint256 => Match) matches;
    }

    mapping (uint256 => TournamentInfo) tournaments;

    event TournamentCreated(string tournamentId, string _matchIds);
    event MatchScoreCreated(string tournamentId, string matchId, string team1Score, string team2Score);

    function createTournament(uint256 _tournamentId, uint256[] memory _matchIds, uint256[] memory _team1Scores, uint256[] memory _team2Scores) public {
        require(tournaments[_tournamentId].created == false, "Tournament cannot be edited");

        TournamentInfo storage tournament = tournaments[_tournamentId];
        tournament.tournamentId = _tournamentId;
        tournament.created = true;
        string memory tournamentStr = string(abi.encodePacked("Tournament ID: ", uintToStr(_tournamentId)));
        string memory matchIdsStr = string(abi.encodePacked("Match IDs: ", uint256ArrayToString(_matchIds)));
        emit TournamentCreated(tournamentStr, matchIdsStr);
        for (uint256 i = 0; i < _matchIds.length; i++) {
            require(_matchIds.length == _team1Scores.length && _matchIds.length == _team2Scores.length, "Invalid match info format");
            tournament.matchIds.push(_matchIds[i]);
            Match memory newMatch = Match({
                matchId: _matchIds[i],
                team1Score: _team1Scores[i],
                team2Score: _team2Scores[i],
                created: true
            });
            tournament.matches[_matchIds[i]] = newMatch;
            string memory eventMatchId = string(abi.encodePacked("Match ID: ", uintToStr(newMatch.matchId)));
            string memory eventTeam1Score = string(abi.encodePacked("Team 1 score: ", uintToStr(newMatch.team1Score)));
            string memory eventTeam2Score = string(abi.encodePacked("Team 2 score: ", uintToStr(newMatch.team2Score)));
            emit MatchScoreCreated(tournamentStr, eventMatchId, eventTeam1Score, eventTeam2Score);
        }
    }

    // function updateMatchScore(uint256 _tournamentId, uint256 _matchId, uint256 _team1Score, uint256 _team2Score) public {
    //     TournamentInfo storage tournament = tournaments[_tournamentId];
    //     require(tournament.matches[_matchId].created, "Invalid match ID");
        
    //     Match storage currMatch = tournament.matches[_matchId];
    //     currMatch.matchId = _matchId;
    //     currMatch.team1Score = _team1Score;
    //     currMatch.team2Score = _team2Score;

    //     emit MatchScoreCreated(_tournamentId, _matchId, _team1Score, _team2Score);
    // }

    function getTournamentInfo(uint256 _tournamentId) public view returns (string memory) {
        require(tournaments[_tournamentId].tournamentId != 0, "Tournament does not exist");

        TournamentInfo storage tournament = tournaments[_tournamentId];
        string memory tournamentJson = '{ "tournamentId": ';
        tournamentJson = string(abi.encodePacked(tournamentJson, uintToStr(tournament.tournamentId), ', "matches": { '));

        for (uint256 i = 0; i < tournament.matchIds.length; i++) {
            Match storage currMatch = tournament.matches[tournament.matchIds[i]];
            string memory matchJson = string(abi.encodePacked('"', uintToStr(currMatch.matchId), '": { "team1Score": ', uintToStr(currMatch.team1Score), ', "team2Score": ', uintToStr(currMatch.team2Score), ' }'));
            tournamentJson = string(abi.encodePacked(tournamentJson, matchJson));
            if (i < tournament.matchIds.length - 1) {
                tournamentJson = string(abi.encodePacked(tournamentJson, ', '));
            }
        }
        tournamentJson = string(abi.encodePacked(tournamentJson, ' } }'));
        return tournamentJson;
    }


    function uintToStr(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Helper function to convert uint256 array to string
    function uint256ArrayToString(uint256[] memory values) internal pure returns (string memory) {
        if (values.length == 0) {
            return "[]";
        }
        
        string memory result = "[";
        for (uint256 i = 0; i < values.length; i++) {
            if (i > 0) {
                result = string(abi.encodePacked(result, ", "));
            }
            result = string(abi.encodePacked(result, uintToStr(values[i])));
        }
        result = string(abi.encodePacked(result, "]"));
        
        return result;
    }
}