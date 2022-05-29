FROM ethereum/client-go:stable

ENTRYPOINT geth console --http \
        --http.port "8545" \
        --http.addr "0.0.0.0" \
        --http.corsdomain "*" \
        --http.vhosts "*" \
        --syncmode light 