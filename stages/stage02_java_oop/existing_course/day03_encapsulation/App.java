/** 知识点：封装。 */
public class App {
    public static void main(String[] args) {
        Account account = new Account("小明", 100.0);

        account.deposit(50.0);
        account.withdraw(30.0);
        account.showBalance();
    }
}

