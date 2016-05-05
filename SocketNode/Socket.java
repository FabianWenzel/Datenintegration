import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.ServerSocket;

public class Socket {

    public static void main(String[] args) {
        ServerSocket server;
        java.net.Socket client;
        InputStream input;

        try {
            server = new ServerSocket(1011);
            client = server.accept();

            input = client.getInputStream();
            String inputString = Socket.inputStreamAsString(input);

            System.out.println(inputString);

            client.close();
            server.close();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static String inputStreamAsString(InputStream stream) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(stream));
        StringBuilder sb = new StringBuilder();
        String line = null;

        while ((line = br.readLine()) != null) {
            sb.append(line + "\n");
        }

        br.close();
        return sb.toString();
    }

}