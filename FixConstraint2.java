import java.sql.*;
public class FixConstraint2 {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://101.79.16.88:3306/team5?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8";
        Class.forName("com.mysql.cj.jdbc.Driver");
        try (Connection conn = DriverManager.getConnection(url, "team5", "JDzKgyMuUw0BZtm9dft5i3N6BguNHceG");
             Statement stmt = conn.createStatement()) {
            // 기존 제약 삭제
            stmt.executeUpdate("ALTER TABLE device_as DROP CHECK chk_device_as_status");
            System.out.println("기존 제약 삭제 완료");
            // 새 제약 추가 (0,1,2,3,4,9 허용)
            stmt.executeUpdate("ALTER TABLE device_as ADD CONSTRAINT chk_device_as_status CHECK (status_as IN (0,1,2,3,4,9))");
            System.out.println("새 제약 추가 완료 - status_as 허용값: 0,1,2,3,4,9");
        }
    }
}
